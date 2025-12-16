package com.blockchain.docsservice.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.blockchain.docsservice.entities.Document;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    Optional<Document> findByHash(String hash);
    List<Document> findAllByOrgId(Long orgId);
    List<Document> findAllByUserId(Long userId);

}
