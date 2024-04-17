import {ContractDeployer, getPairAsync, ProsopoCaptchaContract, wrapQuery} from "@prosopo/contract";
import {ContractAbi, ContractFile, DappPayee, Hash, Payee, RandomProvider} from "@prosopo/captcha-contract";
import {hexToU8a, stringToU8a} from "@polkadot/util";
import {Abi} from "@polkadot/api-contract";
import {randomAsHex} from "@polkadot/util-crypto";
import {EventRecord} from "@polkadot/types/interfaces";
import {KeyringPair} from "@polkadot/keyring/types";
import {ApiPromise} from "@polkadot/api";
import {TransactionQueue} from "@prosopo/tx"
import {ContractSubmittableResult} from '@polkadot/api-contract/base/Contract'
import BN from "bn.js";

export type ProcaptchaTestSetup = {
    contract: ProsopoCaptchaContract,
    contractAddress: string,
    testAccount: string,
    siteKey: string
}

export class ProcaptchaSetup {
    private _api: ApiPromise;
    private _siteKey: string;
    private _port: number;
    private _transactionQueue: TransactionQueue | undefined;

    constructor(api: ApiPromise, siteKey: string, port: number) {
        this._api = api;
        this._siteKey = siteKey;
        this._port = port;
    }

    get api(): ApiPromise {
        return this._api
    }

    get port(): number {
        return this._port
    }

    get siteKey(): string {
        return this._siteKey
    }

    get transactionQueue(): TransactionQueue {
        if (!this._transactionQueue) {
            throw new Error("Transaction queue not initialized")
        }
        return this._transactionQueue
    }

    set transactionQueue(txQueue: TransactionQueue) {
        this._transactionQueue = txQueue
    }

    async isReady() {
        try {
            await this.api.isReady;
            const alicePair = await getPairAsync(undefined, '//Alice', undefined, 'sr25519', 42)
            const contract = await this.deployProcaptchaContract(alicePair);
            console.log("Captcha contract address", contract.address.toString())
            this.transactionQueue = new TransactionQueue(this.api, alicePair)

            // Set the calling pair to Bob so that he is registered as the provider (the calling account is registered in the contract as the provider)
            contract.pair = await getPairAsync(undefined, '//Bob', undefined, 'sr25519', 42);

            await this.procaptchaProviderRegister(contract, this.port);
            console.log(`Registered Bob ${contract.pair.address} as provider`)
            await this.procaptchaProviderSetDataset(contract);

            // any account can register an app site key so using Bob will be fine
            await this.procaptchaAppRegister(contract, this.siteKey);

            // get random active provider and block number from response
            //const randomProvider = await procaptchaGetRandomProvider(contract, siteKey, alicePair.address)

            return {contract, contractAddress: contract.address, testAccount: alicePair.address, siteKey: this.siteKey}
        } catch (e) {
            console.error(e)
            throw new Error(`Failed to setup Procaptcha: ${JSON.stringify(e, null, 4)}`)
        }
    }


    async deployProcaptchaContract(pair: KeyringPair): Promise<ProsopoCaptchaContract> {

        console.log("Deploying Procaptcha contract")
        // Get the contract artefacts from the prosopo captcha contract package
        const jsonContent = JSON.parse(ContractFile)
        const hex = jsonContent['source']['wasm']
        const wasm = hexToU8a(hex)
        const abi = new Abi(ContractAbi)

        // Deploy the contract
        const params: any[] = []
        const deployer = new ContractDeployer(this.api, abi, wasm, pair, params, 0, 0, randomAsHex())
        const deployResult = await deployer.deploy()
        const instantiateEvent: EventRecord | undefined = deployResult.events.find(
            (event) => event.event.section === 'contracts' && event.event.method === 'Instantiated'
        )
        if (instantiateEvent && 'contract' in instantiateEvent.event.data) {
            const address = <string>instantiateEvent?.event.data.contract
            return new ProsopoCaptchaContract(this.api, abi, address, 'procaptcha', 0, pair)
        }
        throw new Error(`Failed to deploy Procaptcha contract: ${JSON.stringify(deployResult)}`)

    }

    async procaptchaProviderRegister(contract: ProsopoCaptchaContract, port: number): Promise<void> {
        try {
            console.log("Registering Procaptcha provider")
            const value = 1000000000
            const providerRegisterArgs: Parameters<typeof contract.query.providerRegister> = [
                Array.from(stringToU8a(`http://host.docker.internal:${port}`)),
                0,
                Payee.dapp,
                {
                    value, // minimum value for a captcha provider to be active in the contract
                },
            ]
            await this.submitTx(contract, 'providerRegister', providerRegisterArgs, value)
        } catch (e) {
            console.error(e)
            throw new Error(`Failed to register Procaptcha provider: ${JSON.stringify(e, null, 4)}`)
        }
    }

    async procaptchaProviderSetDataset(contract: ProsopoCaptchaContract): Promise<{
        datasetId: Hash,
        datasetContentId: Hash
    }> {
        try {
            console.log("Setting Procaptcha provider dataset")
            const dataset = {
                datasetId: "0x28c1ba9d21c00f2e29c9ace8c46fd7dbfbb6f5a5f516771278635ac3ab88c267", // hashed value of "TESTDATASET"
                datasetContentId: "0x7d23f5c5e496dc1c9bcf66c62e2ba7a60152f1486ef6032b56809badf0a48427", // hashed value of "TESTDATASETCONTENT"
            }

            await this.submitTx(contract, 'providerSetDataset', [dataset.datasetId, dataset.datasetContentId], 0)
            return dataset
        } catch (e) {
            throw new Error(`Failed to set Procaptcha provider dataset: ${JSON.stringify(e, null, 4)}`)
        }
    }

    async procaptchaAppRegister(contract: ProsopoCaptchaContract, siteKey: string): Promise<void> {
        try {
            console.log("Registering Procaptcha app")
            const value = 1000000000
            const appRegisterArgs: Parameters<typeof contract.query.dappRegister> = [
                siteKey,
                DappPayee.dapp,
                {
                    value, // minimum value for an app to be active in the contract
                },
            ]
            await this.submitTx(contract, 'providerSetDataset', appRegisterArgs, value)
        } catch (e) {
            throw new Error(`Failed to register Procaptcha app: ${JSON.stringify(e, null, 4)}`)
        }
    }

    private async submitTx(
        contract: ProsopoCaptchaContract,
        method: string,
        args: any[],
        value: number | BN,
        pair?: KeyringPair
    ): Promise<ContractSubmittableResult> {
        return new Promise((resolve, reject) => {
            if (
                contract.nativeContract.tx &&
                method in contract.nativeContract.tx &&
                contract.nativeContract.tx[method] !== undefined
            ) {
                try {
                    contract.dryRunContractMethod(method, args, value).then((extrinsic) => {
                        this.transactionQueue.add(
                            extrinsic,
                            (result: ContractSubmittableResult) => {
                                resolve(result)
                            },
                            pair,
                            method
                        )
                    })
                } catch (err) {
                    reject(err)
                }
            } else {
                reject(new Error('CONTRACT.INVALID_METHOD'))
            }
        })
    }

}

export async function procaptchaGetRandomProvider(contract: ProsopoCaptchaContract, siteKey: string, userAccount: string): Promise<RandomProvider> {
    try {
        console.log("Getting Procaptcha random captcha provider")
        // get a random provider
        return await wrapQuery(
            contract.query.getRandomActiveProvider,
            contract.query
        )(userAccount, siteKey)
    } catch (e) {
        throw new Error(`Failed to get Procaptcha random captcha provider: ${JSON.stringify(e, null, 4)}`)
    }
}


export async function setupProcaptcha(api: ApiPromise, siteKey: string, port: number): Promise<ProcaptchaTestSetup> {
    try {
        const setup = new ProcaptchaSetup(api, siteKey, port)
        return await setup.isReady()
    } catch(e) {
        throw new Error(`Failed to setup Procaptcha: ${JSON.stringify(e, null, 4)}`)
    }
}





