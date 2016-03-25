module TicGitNG
  module Command
    module Comment
      def parser(opts)
        opts.banner = "Usage: ti comment [tic_id] [options]"
        opts.on_head(
          "-m MESSAGE", "--message MESSAGE",
          "Message you would like to add as a comment"){|v|
          options.message = v
        }
        opts.on_head(
          "-f FILE", "--file FILE",
          "A file that contains the comment you would like to add"){|v|
          raise ArgumentError, "Only 1 of -f/--file and -m/--message can be specified" if options.message
          raise ArgumentError, "File #{v} doesn't exist" unless File.file?(v)
          raise ArgumentError, "File #{v} must be <= 2048 bytes" unless File.size(v) <= 2048
          options.file = v
        }
      end

      def execute
        tid = args[0].strip if args[0]
        message, file = options.message, options.file

        if message
          tic.ticket_comment(message, tid)
        elsif file
          tic.ticket_comment(File.read(file), tid)
        else
          return unless message = get_editor_message
          tic.ticket_comment(message.join(''), tid)
        end
      end
    end
  end
end
