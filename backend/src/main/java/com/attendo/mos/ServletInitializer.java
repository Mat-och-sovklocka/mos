package com.attendo.mos;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

/**
 * ServletInitializer is used to configure the application when it is launched
 * by a servlet container.
 * It extends SpringBootServletInitializer to support traditional WAR
 * deployment.
 */
public class ServletInitializer extends SpringBootServletInitializer {

	/**
	 * Configures the application by specifying the primary Spring application
	 * source.
	 *
	 * @param application the SpringApplicationBuilder instance
	 * @return the configured SpringApplicationBuilder
	 */
	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(MosApplication.class);
	}

}
