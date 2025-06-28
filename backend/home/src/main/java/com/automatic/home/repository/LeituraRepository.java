package com.automatic.home.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.automatic.home.model.Leitura;

@Repository
public interface LeituraRepository extends JpaRepository<Leitura, Long> {
	List<Leitura> findTop20ByDispositivoIdOrderByDataHoraDesc(Long idDispositivo);
}
