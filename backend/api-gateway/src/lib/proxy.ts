import axios, { AxiosRequestConfig } from "axios";
import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";

interface ProxyRequestOptions {
  request: AuthenticatedRequest;
  response: Response;
  targetBaseUrl: string;
  targetPath: string;
  pathParams?: Record<string, string | number>;
}

function buildTargetUrl(
  targetBaseUrl: string,
  targetPath: string,
  pathParams: Record<string, string | number> = {},
) {
  const resolvedPath = targetPath.replace(/:(\w+)/g, (_match, key: string) => {
    const value = pathParams[key];

    if (value === undefined || value === null) {
      throw new Error(`MISSING_PATH_PARAM:${key}`);
    }

    const segment = String(value);
    if (!/^[A-Za-z0-9_-]+$/.test(segment)) {
      throw new Error(`INVALID_PATH_PARAM:${key}`);
    }

    return encodeURIComponent(segment);
  });

  return new URL(resolvedPath, `${targetBaseUrl}/`).toString();
}

export async function proxyRequest({
  request,
  response,
  targetBaseUrl,
  targetPath,
  pathParams,
}: ProxyRequestOptions) {
  const headers: Record<string, string> = {};

  if (request.headers.authorization) {
    headers.authorization = request.headers.authorization;
  }

  if (request.headers["content-type"]) {
    headers["content-type"] = request.headers["content-type"];
  }

  if (request.user) {
    headers["x-user-id"] = String(request.user.sub);
    headers["x-user-role"] = request.user.role;
    headers["x-user-email"] = request.user.email;
  }

  try {
    const url = buildTargetUrl(targetBaseUrl, targetPath, pathParams);

    const config: AxiosRequestConfig = {
      method: request.method,
      url,
      params: request.query,
      data: request.body,
      headers,
      validateStatus: () => true,
      timeout: 10_000,
    };

    const upstreamResponse = await axios.request(config);
    return response.status(upstreamResponse.status).json(upstreamResponse.data);
  } catch (error: unknown) {
    if (error instanceof Error && (error.message.startsWith("MISSING_PATH_PARAM") || error.message.startsWith("INVALID_PATH_PARAM"))) {
      return response.status(400).json({ message: "Invalid route parameter." });
    }

    const url = `${targetBaseUrl}${targetPath}`;
    const code = (error as { code?: string }).code;
    console.error(`[proxy] ${request.method} ${url} failed:`, code ?? error);
    return response.status(502).json({
      message: "Upstream service unavailable.",
      target: url,
      code: code ?? "UNKNOWN",
    });
  }
}
