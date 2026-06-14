import NodeCache from "node-cache";
import type { Request, Response, NextFunction } from "express";

const cache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 120,
});

export const cacheMiddleware = (ttl: number = 3600) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.originalUrl;
    const cached = cache.get(key);
    if (cached) {
      res.json(cached);
      return;
    }
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      cache.set(key, data, ttl);
      return originalJson(data);
    };
    next();
  };
};

export default cache;
