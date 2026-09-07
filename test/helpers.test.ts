export const createMockResponse = () => {
  const res: any = {};

  res.status = (statusCode: number) => {
    res.statusCode = statusCode;
    return res;
  };

  res.json = (data: any) => {
    res.body = data;
    return res;
  };

  return res;
};

export const createMockRequest = (body: any = {}, headers: any = {}) => {
  return {
    body,
    headers,
    user: undefined,
  } as any;
};

export const createMockNext = () => {
  let called = false;

  const next = () => {
    called = true;
  };

  return {
    next,
    wasCalled: () => called,
  };
};