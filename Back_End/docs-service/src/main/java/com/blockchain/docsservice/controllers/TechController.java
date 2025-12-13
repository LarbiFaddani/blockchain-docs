package com.blockchain.docsservice.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.web3j.protocol.Web3j;

@RestController
@RequestMapping("/api/tech")
@RequiredArgsConstructor
public class TechController {

    private final Web3j web3j;

    @GetMapping("/blockchain-info")
    public ResponseEntity<String> blockchainInfo() throws Exception {
        var clientVersion = web3j.web3ClientVersion().send();
        return ResponseEntity.ok("Node: " + clientVersion.getWeb3ClientVersion());
    }
}
