# Plan: Encapsulate Global Response Module

## Goal
Implement a global response helper module to standardize API return formats using `ResponseDTO` and `PaginationResponseDTO`, and replace manual response construction in existing controllers.

## Steps

1.  **Create Response Utility**
    - Create `src/commons/utils/result.util.ts`.
    - Define a `Result` class with static methods:
        - `ok<T>(data: T, msg?: string): ResponseDTO<T>`
        - `fail(code: number, msg: string, data?: any): ResponseDTO<any>`
        - `page<T>(list: T[], total: number): PaginationResponseDTO<T>`
    - Export `Result` from `src/commons/utils/index.ts` (if applicable) or directly use it.

2.  **Refactor Controllers**
    - Modify `src/user/user.controller.ts`:
        - Import `Result`.
        - Replace manual object literals in `getUser` and `createUser` with `Result.page` and `Result.ok`.
    - Modify `src/app.controller.ts`:
        - Import `Result`.
        - Replace manual object literal in `getHello` with `Result.ok` (ensure `code` matches 200 or make it configurable if 0 is required). *Note: `ResponseDTO` implies 200 standard.*

3.  **Refactor Exception Filter**
    - Modify `src/commons/filters/http-exception/http-exception.filter.ts`:
        - Import `Result`.
        - Use `Result.fail` to construct the error response.

4.  **Verification**
    - Run the application and check endpoints (e.g., `/user/all`, `/`) to ensure the response format remains consistent.
