module TicGitNG
  module Command
    COMMANDS = {}
    DOC = {}

    def self.register(mod_name, doc, *commands)
      autoload(mod_name, "ticgit-ng/command/#{mod_name.downcase}")
      DOC[commands] = doc
      commands.each{|cmd| COMMANDS[cmd] = mod_name }
    end

    register 'Assign', 'Assings a ticket to someone', 'assign'
    register 'Attach', 'Attach file to ticket', 'attach'
    register 'Checkout', 'Checkout a ticket', 'checkout', 'co'
    register 'Comment', 'Comment on a ticket', 'comment'
    register 'List', 'List tickets', 'list'
    register 'Milestone', 'List and modify milestones', 'milestone'
    register 'New', 'Create a new ticket', 'new'
    register 'Points', 'Assign points to a ticket', 'points'
    register 'Recent', 'List recent activities', 'recent'
    register 'Show', 'Show a ticket', 'show'
    register 'State', 'Change state of a ticket', 'state'
    register 'Tag', 'Modify tags of a ticket', 'tag'
    register 'Sync', 'Sync tickets', 'sync'

    def self.get(command)
      if mod_name = COMMANDS[command]
        const_get(mod_name)
      end
    end

    def self.usage(action, args)
      option_parser = parser(action, &method(:default_usage))
      option_parser.parse!(args)
      option_parser
    end

    def self.default_usage(o)
      o.banner = "Usage: ti COMMAND [FLAGS] [ARGS]"
      o.top.append ' ', nil, nil
      o.top.append 'The available ticgit commands are:', nil, nil

      DOC.each do |commands, doc|
        # get the longest version
        command = commands.sort_by{|cmd| cmd.size }.last
        o.top.append("    %-32s %s" % [command, doc], nil, nil)
      end
    end

    def self.parser(action, &block)
      OptionParser.new do |o|
        o.banner = "Usage: ti #{action} [FLAGS] [ARGS]"

        o.base.append ' ', nil, nil
        o.base.append 'Common options:', nil, nil
        o.on_tail('-v', '--version', 'Show the version number'){
          puts TicGitNG::VERSION
          exit
        }
        o.on_tail('-h', '--help', 'Display this help'){
          puts o
          exit
        }

        if block_given?
          yield(o) if block_given?
          unless o.top.list.empty?
            if action
              o.top.prepend "Options for #{action} command:", nil, nil
              o.top.prepend ' ', nil, nil
            end
          end
        end
      end
    end
  end
end
