## Building the app

- tag the branch
    ```bash
    TAG=$(jq -r '.version' package.json)
    git tag $TAG
    git push origin $TAG
    ```
- run `npm run build`
- run `npm run deploy`
