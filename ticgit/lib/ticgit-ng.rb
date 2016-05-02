require 'fileutils'
require 'logger'
require 'optparse'
require 'ostruct'
require 'set'
require 'yaml'

# Add the directory containing this file to the start of the load path if it
# isn't there already.
$:.unshift(File.dirname(__FILE__)) unless
  $:.include?(File.dirname(__FILE__)) || $:.include?(File.expand_path(File.dirname(__FILE__)))

require 'rubygems'
# requires git >= 1.0.5
require 'git'

#Only redefine if we are not using 1.9
unless Config::CONFIG["ruby_version"][/^\d\.9/]
  # FIXME: Monkeypatch git until fixed upstream
  module Git
    class Lib
      def config_get(name)
        do_get = lambda do |name|
          command('config', ['--get', name])
        end
        if @git_dir
          Dir.chdir(@git_dir, &do_get)
        else
          build_list.call
        end
      end
    end
  end
end

require 'ticgit-ng/base'
require 'ticgit-ng/cli'
module TicGitNG
  autoload :VERSION, 'ticgit-ng/version'
  autoload :Comment, 'ticgit-ng/comment'
  autoload :Ticket, 'ticgit-ng/ticket'

  # options
  #   :logger => Logger.new(STDOUT)
  def self.open(git_dir, options = {})
    Base.new(git_dir, options)
  end

  class OpenStruct < ::OpenStruct
    def to_hash
      @table.dup
    end
  end
end
