# Provide a simple gemspec so you can easily use your
# project in your rails apps through git.
Gem::Specification.new do |s|
  s.name = "corona-js-rails"
  # not quite semver - the first 3 digits track the version of the library as forked from
  # http://www.eyecon.ro/bootstrap-slider/, but the 4th digit tracks the USL patches.
  s.version = "1.0.0.0"
  s.authors = ["Roy", "Andrea", "Saima", "Jieqi", "Lokman"]
  s.email = ["corona@mailinator.com"]
  s.homepage = "https://bitbucket.org/roychong/cs3213-hw3-coronajs"
  
  s.summary = "MVC Javascript Framework"
  s.description = "An MVC Javascript Framework designed for Rails"
  s.license = 'GPL-2'
  s.files = ["lib/corona-js-rails.rb"] + 
            ["vendor/assets/javascripts/corona-js-rails.js"]
  
  s.add_dependency('railties', '>= 3.1.0')
  s.add_dependency('jquery-rails', '>= 3.0.4')
  s.add_dependency('underscore-rails', '>= 1.5.2')
  
  s.require_paths = ['lib']
end
