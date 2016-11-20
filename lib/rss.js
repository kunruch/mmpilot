var RSS = require('rss')
var fs = require('fs')
var path = require('path')
var config = require('./../config/config').config
var logger = require('./../lib/logger')

// Feed is generated only for the main archive.
// Feeds for tag and categories would be overkill and more suited for WordPress like CMS
exports.generateFeed = function (blog) {
  var out = path.join(blog.config.dest, 'feed.xml')

  var feedOptions = {
    title: blog.config.index.title,
    description: blog.config.index.description,
    generator: 'mmpilot v' + config.package.version,
    feed_url: blog.url + '/feed.xml',
    site_url: config.site.url,
    pubDate: Date.now()
  }

  var feed = new RSS(feedOptions)
  // Iterate though each blog post and add to RSS feed
  for (var i = 0; i < blog.posts.length && i < blog.config.feed.entries; i++) {
    var post = blog.posts[i]
    var categories = []
    var desription = blog.config.feed.content === 'summary' ? post.summary : post.content

    post.categories.forEach(function (category) {
      categories.push(category.title)
    })

    var itemOptions = {
      title: post.title,
      description: desription,
      url: post.url,
      categories: categories,
      date: post.date
    }
    feed.item(itemOptions)
  }
  var xml = feed.xml({indent: true})
  // console.log(xml)
  try {
    fs.writeFileSync(out, xml)
    logger.info('Blog feed generated: ' + out)
  } catch (e) {
    logger.debug('Could not create feed: ' + e)
  }
}
