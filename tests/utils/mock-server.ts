type ToolHandler = (...args: unknown[]) => Promise<{
  content: Array<{ type: string; text: string }>;
}>;

export interface MockServer {
  registerTool: jest.Mock;
  getHandler(name: string): ToolHandler | undefined;
}

export function createMockServer(): MockServer {
  const handlers = new Map<string, ToolHandler>();

  const registerTool = jest.fn(
    (name: string, _config: unknown, handler: ToolHandler) => {
      handlers.set(name, handler);
      return {};
    }
  );

  return {
    registerTool,
    getHandler: (name: string) => handlers.get(name),
  };
}
