require 'rubygems'
require 'rake'
require 'rake/clean'
require 'rake/rdoctask'
require 'rspec/core/rake_task'

CLEAN.include('**/*.gem')

desc "Creates the TicGit-ng gem"
task :create_gem => [:clean] do
  spec = eval(IO.read('ticgit-ng.gemspec'))
  gem = Gem::Builder.new(spec).build
  Dir.mkdir("pkg") unless Dir.exists? "pkg"
  FileUtils.mv("#{File.dirname(__FILE__)}/#{gem}", "pkg")
end

desc "Runs spec suite"
RSpec::Core::RakeTask.new(:spec) do |spec|
  spec.pattern = 'spec/*_spec.rb'
  spec.rspec_opts = ['--backtrace --colour']
end

desc "Creates rdoc documentation"
Rake::RDocTask.new do |rdoc|
  version = File.exist?('VERSION') ? File.read('VERSION').chomp : ""
  rdoc.rdoc_dir = 'rdoc'
  rdoc.title = "TicGit-ng #{version}"
  rdoc.rdoc_files.include('README*')
  rdoc.rdoc_files.include('lib/**/*.rb')
end

task :default => :create_gem
