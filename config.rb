###
# Compass
###

# Change Compass configuration
compass_config do |config|
  config.output_style = :expanded
  config.line_comments = false

  # Make a copy of sprites with a name that has no uniqueness of the hash.
  config.on_sprite_saved do |filename|
    if File.exists?(filename)
      FileUtils.cp filename, filename.gsub(%r{-s[a-z0-9]{10}\.png$}, '.png')
    end
  end

  # Replace in stylesheets generated references to sprites
  # by their counterparts without the hash uniqueness.
  config.on_stylesheet_saved do |filename|
    if File.exists?(filename)
      css = File.read filename
      File.open(filename, 'w+') do |f|
        f << css.gsub(%r{-s[a-z0-9]{10}\.png}, '.png')
      end
    end
  end
end

###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
# page "/path/to/file.html", :layout => false
#
# With alternative layout
# page "/path/to/file.html", :layout => :otherlayout
#
# A path which all have the same layout
# with_layout :admin do
#   page "/admin/*"
# end

# Proxy pages (http://middlemanapp.com/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", :locals => {
#  :which_fake_page => "Rendering a fake page with a local variable" }

###
# Helpers
###

# Automatic image dimensions on image_tag helper
# activate :automatic_image_sizes

# Reload the browser automatically whenever files change
activate :livereload

activate :directory_indexes

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     "Helping"
#   end
# end

helpers do
  def slls(str)
    str.gsub(/\s\/>/, '>')
  end

  def get_meta(type, default=data.default)
    current = current_page.data[type]
    default = default[type]
    current = default if current.nil?
  end

  def get_page_styles(id=nil)
    ids = id.split('-')
    names = []
    ids.size.times do |i|
      tid = ids.take(i + 1).join('-')
      path = "#{root}/source/css/#{tid}.css.sass"
      if File.exist?(path)
        names.push(tid)
      end
    end

    return names
  end

  def get_data_main(id=nil)
    ids = id.split('-')
    name = ""
    ids.size.times do |i|
      tid = ids.take(i + 1).join('-')
      path = "#{root}/source/js/all-#{tid}.js"
      if File.exist?(path)
        name = "-" + tid
      end
    end

    name = "all" + name
  end
end

set :css_dir, 'css'

set :js_dir, 'js'

set :images_dir, 'img'

set :layouts_dir, 'layouts'

set :slim, { :pretty => true, :sort_attrs => false, :format => :html }

set :relative_links, true

# configure :development do
#   set :debug_assets, true
# end

# Build-specific configuration
configure :build do
  # For example, change the Compass output style for deployment
  # activate :minify_css

  # Minify Javascript on build
  # activate :minify_javascript

  # Enable cache buster
  # activate :asset_hash

  # Use relative URLs
  activate :relative_assets

  # Or use a different image path
  # set :http_path, "/Content/images/"

  ignore "*.bak"
  ignore "js/build.js"
  ignore "js/build-*.js"
  ignore "js/main.js"
  ignore "js/main-*.js"
  ignore "js/mod"
  ignore "js/mod/*.js"
  ignore "js/app"
  ignore "js/app/*.js"
  ignore "js/lib/require.js"
  ignore "js/lib/almond.js"
  ignore "sprite_*-s*.png"

end

# configure :development do
#   activate :php
# end
configure :development do
  activate :livereload, ignore: [
    "#{root}/bower_components/*",
    "#{root}/node_modules/*",
    "#{root}/src/*"
  ]
end

activate :autoprefixer do |config|
  config.browsers = ['last 2 versions', 'Explorer > 8']
  config.cascade  = false
  # config.inline   = true
  # config.ignore   = ['hacks.css']
end

# after_configuration do
#   sprockets.append_path "#{root}/components/js/"
# end
