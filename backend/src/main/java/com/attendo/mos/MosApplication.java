package com.attendo.mos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MosApplication {

	/**
	 * The main entry point of the application.
	 * <p>
	 * This method uses Spring Boot's {@link SpringApplication#run(Class, String[])}
	 * to launch the application.
	 * </p>
	 *
	 * @param args command-line arguments passed to the application
	 */
	public static void main(String[] args) {
		SpringApplication.run(MosApplication.class, args);
	}

}
