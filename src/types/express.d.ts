import 'express';

declare module 'express' {
  interface Request {
    session?: {
      userId: number;
      sessionToken: string;
      timezone: string;
    };
  }
}
