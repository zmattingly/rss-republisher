# rss-republisher
Schedule and Republish an RSS Feeds via Github Pages &amp; Actions

## How to use this Repo
* Fork it
* Clone it down
* Create a new branch called `gh-pages` and push it
	* `git checkout -b gh-pages`
	* `git push --set-upstream origin gh-pages`
* Create a new branch called `config`
	* `git checkout -b config`
* Modify `config.js` appropriately (should be self explanatory)
* Commit and push the branch
	* `git add config.json`
	* `git commit -m "Modified config.json with my username and feed shortnames and urls`
	* `git push --set-upstream origin config`
* Your github pages site at `https://[GITHUB USERNAME].github.io/rss-republisher` should now be updated with your republished .rss feeds at midnight each day.
