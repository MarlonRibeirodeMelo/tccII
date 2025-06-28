package com.automatic.home.config;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtTokenUtil {

    /** HS-512 precisa de ≥ 64 bytes (512 bits) na chave */
    private static final String SECRET =
            "mude-para-uma-chave-aleatoria-com-pelo-menos-64-bytes-de-comprimento-..............................";

    private static final long EXPIRATION_MILLIS = 4 * 60 * 60 * 1000; // 4 h

    /** Objeto imutável e reutilizável para assinar/verificar tokens */
    private final SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    /*------------------------------------------------------------------
     *  Geração
     *-----------------------------------------------------------------*/
    public String generateToken(String username,
                                String schema,
                                Integer idVendedor,
                                Integer idMatriz) {

        long now = System.currentTimeMillis();

        return Jwts.builder()
                   .subject(username)
                   .claim("empresa",    schema)
                   .claim("idVendedor", idVendedor)
                   .claim("idMatriz",   idMatriz)
                   .issuedAt(new Date(now))
                   .expiration(new Date(now + EXPIRATION_MILLIS))
                   .signWith(key, SignatureAlgorithm.HS512)
                   .compact();
    }

    /*------------------------------------------------------------------
     *  Validação + extração de claims
     *-----------------------------------------------------------------*/
    public boolean validateToken(String token) {
        try {
            parseClaims(token);            // lança se assinatura ou expiração forem inválidas
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    public String getSchemaFromToken(String token) {
        return parseClaims(token).get("empresa", String.class);
    }

    public <T> T getClaimFromToken(String token, String claimKey, Class<T> claimType) {
        return parseClaims(token).get(claimKey, claimType);
    }

    /*------------------------------------------------------------------
     *  Utilitário interno
     *-----------------------------------------------------------------*/
    private Claims parseClaims(String token) {
        Jws<Claims> jws = Jwts.parser()     // cria o JwtParserBuilder
                              .verifyWith(key)
                              .build()      // constrói o JwtParser
                              .parseSignedClaims(token);
        return jws.getPayload();
    }
}
