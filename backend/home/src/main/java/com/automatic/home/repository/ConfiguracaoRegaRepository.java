package com.automatic.home.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.automatic.home.model.ConfiguracaoRega;

@Repository
public interface ConfiguracaoRegaRepository extends JpaRepository<ConfiguracaoRega, Long> {
	@Query("SELECT c FROM ConfiguracaoRega c ORDER BY c.id DESC LIMIT 1")
    ConfiguracaoRega buscarUltimaConfiguracao();
   
}
