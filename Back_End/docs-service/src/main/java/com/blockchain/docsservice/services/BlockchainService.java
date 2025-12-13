package com.blockchain.docsservice.services;

import com.blockchain.docsservice.utils.DocumentRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.tx.Contract;
import org.web3j.tx.gas.ContractGasProvider;
import org.web3j.utils.Numeric;

import jakarta.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
public class BlockchainService {

    private final Web3j web3j;
    private final ContractGasProvider gasProvider;

    @Value("${blockchain.contract.address}")
    private String contractAddress;

    @Value("${blockchain.private-key}")
    private String privateKey;

    private DocumentRegistry contract;

    @Value("${blockchain.rpc-url}")
    private String rpcUrl;


    @PostConstruct
    public void init() {
        Credentials credentials = Credentials.create(privateKey);

        this.contract = DocumentRegistry.load(
                contractAddress,
                web3j,
                credentials,
                gasProvider
        );
    }

    @PostConstruct
    public void logRpc() {
        System.out.println("RPC URL USED = [" + rpcUrl + "]");
    }



    public String registerDocument(String hashHex, String docType) throws Exception {
        byte[] hashBytes = Numeric.hexStringToByteArray(hashHex);
        var tx = contract.registerDocument(hashBytes, docType).send();
        return tx.getTransactionHash();
    }

    public boolean isDocumentRegistered(String hashHex) throws Exception {
        byte[] hashBytes = Numeric.hexStringToByteArray(hashHex);
        return contract.isDocumentRegistered(hashBytes).send();
    }
}
