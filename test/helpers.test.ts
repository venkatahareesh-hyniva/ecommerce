export const createMockRequest = (body: any = {}) => {
  return {
    body,
    params: {},
    query: {},
    headers: {},
    user: {},
  };
};

export const createMockResponse = () => {
  const res = {
    statusCode: 200,
    body: null as any,

    status(code: number) {
      res.statusCode = code;
      return res;
    },

    json(data: any) {
      res.body = data;
      return res;
    },

    send(data: any) {
      res.body = data;
      return res;
    },
  };

  return res;
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