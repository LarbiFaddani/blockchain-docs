package com.blockchain.docsservice.utils;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import io.reactivex.Flowable;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.*;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.abi.datatypes.generated.Uint256;

import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.RemoteCall;

import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.Contract;
import org.web3j.tx.gas.ContractGasProvider;

public class DocumentRegistry extends Contract {

    public static final String BINARY = "0x";
    // Aucun besoin du bytecode pour interagir avec un contrat déjà déployé.

    // ⚡ Événement du contrat
    public static final Event DOCUMENTREGISTERED_EVENT = new Event("DocumentRegistered",
            Arrays.asList(
                    new TypeReference<Bytes32>(true) {},
                    new TypeReference<Utf8String>() {},
                    new TypeReference<Address>(true) {},
                    new TypeReference<Uint256>() {}
            ));

    protected DocumentRegistry(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider gasProvider) {
        super(BINARY, contractAddress, web3j, credentials, gasProvider);
    }

    // 🟦 Méthode pour enregistrer un document (transaction)
    public RemoteCall<TransactionReceipt> registerDocument(byte[] hashBytes, String docType) {
        final Function function = new Function(
                "registerDocument",
                Arrays.asList(new Bytes32(hashBytes), new Utf8String(docType)),
                Collections.emptyList()
        );
        return executeRemoteCallTransaction(function);
    }

    // 🟩 Lecture "isDocumentRegistered" (appel non payant)
    public RemoteCall<Boolean> isDocumentRegistered(byte[] hashBytes) {
        final Function function = new Function(
                "isDocumentRegistered",
                Arrays.asList(new Bytes32(hashBytes)),
                Arrays.asList(new TypeReference<Bool>() {})
        );
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    // 🟨 Lecture "getDocument" (informations complètes)
    public RemoteCall<GetDocumentResponse> getDocument(byte[] hashBytes) {
        final Function function = new Function(
                "getDocument",
                Arrays.asList(new Bytes32(hashBytes)),
                Arrays.asList(
                        new TypeReference<Bool>() {},
                        new TypeReference<Utf8String>() {},
                        new TypeReference<Address>() {},
                        new TypeReference<Uint256>() {}
                )
        );
        return new RemoteCall<>(() -> {
            List<Type> results = executeCallMultipleValueReturn(function);
            return new GetDocumentResponse(
                    (Boolean) results.get(0).getValue(),
                    (String) results.get(1).getValue(),
                    (String) results.get(2).getValue(),
                    (BigInteger) results.get(3).getValue()
            );
        });
    }

    // 🟦 Classe interne qui contient la réponse de getDocument()
    public static class GetDocumentResponse {
        public boolean exists;
        public String docType;
        public String issuer;
        public BigInteger timestamp;

        public GetDocumentResponse(boolean exists, String docType, String issuer, BigInteger timestamp) {
            this.exists = exists;
            this.docType = docType;
            this.issuer = issuer;
            this.timestamp = timestamp;
        }
    }

    // 🟧 Charger un contrat existant
    public static DocumentRegistry load(
            String contractAddress,
            Web3j web3j,
            Credentials credentials,
            ContractGasProvider gasProvider) {
        return new DocumentRegistry(contractAddress, web3j, credentials, gasProvider);
    }
}
