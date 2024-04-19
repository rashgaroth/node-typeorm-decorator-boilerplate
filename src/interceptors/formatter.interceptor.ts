import { Action, Interceptor, InterceptorInterface } from 'routing-controllers';

@Interceptor()
export class ResultFormatter implements InterceptorInterface {
  intercept(_: Action, content: Record<string, any>) {
    const data = {
      result: content?.result,
      pagination: content?.pagination,
    };
    if (!data?.result) {
      data.result = content;
    }

    const filteredData = {
      result: data.result,
      pagination: data.pagination,
    };

    if (!Object.prototype.hasOwnProperty.call(content, 'pagination')) {
      delete filteredData.pagination;
    }

    return {
      data: filteredData,
    };
  }
}
