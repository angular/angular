lib= File.expand_path('../lib/', __FILE__)
$:.unshift lib unless $:.include?(lib)

require './lib/ticgit-ng'

Gem::Specification.new do |s|
  s.name      = "TicGit-ng"
  s.version   = TicGitNG::VERSION
  s.platform  = Gem::Platform::RUBY
  s.date      = Date.today.to_s
  s.authors   = ["Scott Chacon", "Jeff Welling"]
  s.email     = ["Jeff.Welling@gmail.com"]
  s.homepage  = "https://github.com/jeffWelling/ticgit"
  s.summary   = "Git based distributed ticketing system"
  s.description="TicGit-ng is a simple ticketing system, roughly similar to the Lighthouse model, that is based in git."

  s.rubyforge_project         = "ticgit-ng"

  s.add_dependency "git"
  s.add_development_dependency "rspec"
  s.files       = Dir.glob("{bin,lib}/**/*") + %w( LICENSE_MIT LICENSE_GPL README.mkd )
  s.executables = ['ti', 'ticgitweb']
  s.require_path= 'lib'
end
