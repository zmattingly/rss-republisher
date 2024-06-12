import { readFileSync, existsSync, writeFileSync } from 'fs';
import Parser from 'rss-parser';
import RSS from 'rss';

(async () => {
  const config = JSON.parse(readFileSync('config.json'))

  const parser = new Parser();
  const githubUsername = config.githubUsername;
  const feedLinks = [];

  for (let feed of config.feeds) {
    const { shortName, feedUrl } = feed;
    console.log('shortName:', shortName);
    console.log('feedUrl', feedUrl);
    if (!shortName || !feedUrl) {
      throw new Error("config.json feed format invalid");
    }

    let dataFilepath = `./data/${shortName}.json`;
    let rssFilepath = `./public/${shortName}.rss`;
    let lastPostIndex = 0;

    if (!existsSync(dataFilepath)) {
      writeFileSync(dataFilepath, JSON.stringify({ lastPostIndex }));
    } else {
      let data = JSON.parse(readFileSync(dataFilepath, 'utf8'))
      lastPostIndex = data.lastPostIndex + 1;
    }

    let compiledFeed;
    if (existsSync(rssFilepath)) {
      const existingFeed = await parser.parseString(readFileSync(rssFilepath, 'utf8'));
      compiledFeed = new RSS({
        title: existingFeed.title,
        description: existingFeed.description,
        feed_url: existingFeed.feedUrl,
        site_url: existingFeed.link
      });

      existingFeed.items.forEach(item => {
        compiledFeed.item({
          title: item.title,
          description: item.content,
          url: item.link,
          date: item.pubDate
        })
      });
    } else {
      compiledFeed = new RSS({
        title: `Republished ${shortName} Feed`,
        description: `This is the scheduled republished ${shortName} RSS Feed.`,
        feed_url: `https://${githubUsername}.github.io/rss-republish/${shortName}.rss`,
        site_url: `https://${githubUsername}.github.io/rss-republish`
      });
    }

    const targetFeed = await parser.parseURL(feedUrl);
    const targetPost = targetFeed.items[lastPostIndex];

    compiledFeed.item({
      title: targetPost.title,
      description: targetPost.content,
      url: targetPost.link,
      date: targetPost.pubDate
    });

    writeFileSync(rssFilepath, compiledFeed.xml({ ident: true }));
    writeFileSync(dataFilepath, JSON.stringify({ lastPostIndex }));

    console.log(`Republished to ${shortName}: ${targetPost.title}`);
    feedLinks.push(`<li><a href="${shortName}.rss">${shortName}</a></li>`);
  }

  const indexHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Scheduled Republished RSS Feeds</title>
    </head>
    <body>
      <h1>Republished RSS Feeds</h1>
      <ul>
        ${feedLinks.join('\n')}
      </ul>
    </body>
    </html>
  `;

  writeFileSync('./public/index.html', indexHtml)
})();