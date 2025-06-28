package com.automatic.home.config;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private JwtTokenUtil jwtTokenUtil;

	public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil) {
		this.jwtTokenUtil = jwtTokenUtil;
	}

	@Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtTokenUtil.validateToken(token)) {
            	 String username = jwtTokenUtil.getUsernameFromToken(token);
                 // Cria um objeto CustomUserDetails (opcional)
                 CustomUserDetails userDetails = new CustomUserDetails(username);

                 // Armazena no SecurityContext
                 UsernamePasswordAuthenticationToken authentication =
                     new UsernamePasswordAuthenticationToken(userDetails, null, new ArrayList<>());
                 SecurityContextHolder.getContext().setAuthentication(authentication);
              
               
            }
       
        
        }
        
        filterChain.doFilter(request, response);
	}
}
