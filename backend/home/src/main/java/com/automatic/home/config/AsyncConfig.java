package com.automatic.home.config;



import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);       // Número de threads básicas
        executor.setMaxPoolSize(8);        // Número máximo de threads
        executor.setQueueCapacity(100);    // Capacidade da fila
        executor.setThreadNamePrefix("FaqAsync-");
        executor.initialize();
        return executor;
    }
}

