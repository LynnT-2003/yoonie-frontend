class NetworkConfig {
  private static instance: NetworkConfig;
  public readonly baseURL: string;

  private constructor() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!raw) {
      console.warn(
        '[NetworkConfig] NEXT_PUBLIC_API_BASE_URL not set — using http://localhost:8080/api as placeholder. ' +
          'Set NEXT_PUBLIC_API_BASE_URL in .env.local to point at your backend.',
      );
      this.baseURL = 'http://localhost:8080/api';
      return;
    }
    this.baseURL = raw.replace(/\/+$/, '');
  }

  /** POST auth/refresh on the Nest API (works if base is origin or ends with `/api`). */
  authRefreshUrl(): string {
    const base = this.baseURL;
    return base.endsWith('/api') ? `${base}/auth/refresh` : `${base}/api/auth/refresh`;
  }

  static get shared(): NetworkConfig {
    if (!NetworkConfig.instance) NetworkConfig.instance = new NetworkConfig();
    return NetworkConfig.instance;
  }
}

export default NetworkConfig;