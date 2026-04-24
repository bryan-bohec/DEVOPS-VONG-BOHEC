import axios, { AxiosRequestConfig, Method } from "axios";
import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";

interface ProxyRequestOptions {
  request: AuthenticatedRequest;
  response: Response;
  targetBaseUrl: string;
  targetPath: string;
}

export async function proxyRequest({
  request,
  response,
  targetBaseUrl,
  targetPath,
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

  const url = `${targetBaseUrl}${targetPath}`;

  const config: AxiosRequestConfig = {
    method: request.method as Method,
    url,
    params: request.query,
    data: request.body,
    headers,
    validateStatus: () => true,
    timeout: 10_000,
  };

  try {
    const upstreamResponse = await axios.request(config);
    return response.status(upstreamResponse.status).json(upstreamResponse.data);
  } catch (error: unknown) {
    const code = (error as { code?: string }).code;
    console.error(`[proxy] ${request.method} ${url} failed:`, code ?? error);
    return response.status(502).json({
      message: "Upstream service unavailable.",
      target: url,
      code: code ?? "UNKNOWN",
    });
  }
}
