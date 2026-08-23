---
description: Check my code before deploying to production
agent: plan
---
Check my code before deploying to production to ensure that it is working as expected and to catch any potential bugs early on, like:
- React infinite re-render loops
- SSR hydration mismatches
- Race conditions in streaming responses
- Performance bottlenecks and unnecessary re-renders
- Code that works but shouldn't
- Incorrect imports
- Vulnerabilities in dependencies

Create a clear, concise and just text report, whitout any code snippets, that includes the following sections:
- Summary: A brief overview of the main issues found and their potential impact on the application.
- A plan to fix the issues: A detailed plan outlining the steps that will be taken to address each issue, including any necessary code changes, testing, and deployment steps.
- Recommendations: Any additional recommendations for improving the code quality and maintainability of the application, such as implementing best practices, using specific tools or libraries, or adopting a particular coding style. that reduce the likelihood of similar issues occurring in the future.

Finally, run `pnpm dlx react-doctor@latest --verbose` and include the output in the report.