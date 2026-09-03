export function sendBadRequest(res: any, message: string) {
  return res.status(400).json({ message });
}

export function sendNotFound(res: any, message: string) {
  return res.status(404).json({ message });
}

export function sendUnauthorized(res: any, message: string) {
  return res.status(401).json({ message });
}
export function sendForBiddden(res: any, message: string) {
  return res.status(403).json({ message });
}

export function sendInternalServerError(res: any, message: string) {
  return res.status(500).json({ message ,Error});
}

export function sendSuccessResponse(res: any, message: string, data?: any) {
  return res.status(200).json({ message, data });
}

export function sendCreatedResponse(res: any, message: string, data?: any) {
  return res.status(201).json({ message, data });
}
