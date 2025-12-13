package com.blockchain.docsservice.utils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class FileUtils {

    private static final String STORAGE_DIR =
            System.getProperty("user.dir") + "/docs-service/storage";

    public static String saveFile(byte[] content, String filename) {
        try {
            Path dir = Path.of(STORAGE_DIR);

            // Créer le dossier si besoin
            if (!Files.exists(dir)) {
                Files.createDirectories(dir);
            }

            Path filePath = dir.resolve(filename);

            // Sauvegarde propre
            Files.write(filePath, content);

            System.out.println("📁 Fichier sauvegardé dans : " + filePath.toAbsolutePath());

            return filePath.toString();

        } catch (IOException e) {
            throw new RuntimeException("Erreur de sauvegarde du fichier", e);
        }
    }
}
