/*
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.googlecodesamples.cloud.jss.lds.config;

import com.google.cloud.opentelemetry.trace.TraceExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.trace.SdkTracerProvider;
import io.opentelemetry.sdk.trace.export.BatchSpanProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class Config {
	/**
	 * Create a distributed tracing system based on the OpenTelemetry
	 * and uses the Google Cloud Trace Exporter
	 */
	@Bean
	public OpenTelemetrySdk createOpenTelemetrySdk() throws IOException {
		TraceExporter googleTraceExporter = TraceExporter.createWithDefaultConfiguration();
		SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
				.addSpanProcessor(BatchSpanProcessor.builder(googleTraceExporter).build())
				.build();
		return OpenTelemetrySdk.builder()
				.setTracerProvider(tracerProvider)
				.build();
	}
}
