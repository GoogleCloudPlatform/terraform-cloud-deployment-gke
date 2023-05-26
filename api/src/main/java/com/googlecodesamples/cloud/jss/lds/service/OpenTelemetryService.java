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

package com.googlecodesamples.cloud.jss.lds.service;

import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Scope;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import org.springframework.stereotype.Service;

import java.util.concurrent.Callable;

@Service
public class OpenTelemetryService {
	private final static String INSTRUMENTATION_SCOPE_VERSION = "1.0.0";
	private final OpenTelemetrySdk openTelemetrySdk;
	public OpenTelemetryService(OpenTelemetrySdk openTelemetrySdk) {
		this.openTelemetrySdk = openTelemetrySdk;
	}

	/**
	 * create and manage a new span in OpenTelemetry for a given instrumentation scope
	 * and executes a callable method within it.
	 *
	 * @param instrumentationScopeName represents the name of the instrumentation library that is being used.
	 * @param spanName  represents the name of the span that is being created.
	 * @param callable is a function that is to be executed within the span.
	 * @return generic type
	 */
	public <T> T spanScope(String instrumentationScopeName, String spanName, Callable<T> callable) throws Exception {
		Tracer tracer = openTelemetrySdk.getTracer(instrumentationScopeName, INSTRUMENTATION_SCOPE_VERSION);
		Span span = tracer.spanBuilder(spanName).startSpan();
		try (Scope ss = span.makeCurrent()) {
			return callable.call();
		} finally {
			span.end();
		}
	}
}
