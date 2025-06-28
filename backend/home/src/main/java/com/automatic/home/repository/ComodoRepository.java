package com.automatic.home.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.automatic.home.model.Comodo;

@Repository
public interface ComodoRepository extends JpaRepository<Comodo, Long> {
	
	List<Comodo> findAllByStatusTrue(); 
}
