package com.blockchain.docsservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.gas.ContractGasProvider;
import org.web3j.tx.gas.StaticGasProvider;

import java.math.BigInteger;

@Configuration
public class Web3jConfig {

    @Value("${blockchain.rpc-url:http://127.0.0.1:7545}")
    private String rpcUrl;

    @Bean
    public Web3j web3j() {
        return Web3j.build(new HttpService(rpcUrl));
    }

    @Bean
    public ContractGasProvider contractGasProvider() {
        BigInteger gasPrice = BigInteger.valueOf(2_000_000_000L); // 2 gwei (local)
        BigInteger gasLimit = BigInteger.valueOf(2_500_000L);     // < 3,000,000

        return new StaticGasProvider(gasPrice, gasLimit);
    }
}
