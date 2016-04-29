module TicGitNG
  module Command
    module New
      def parser(opts)
        opts.banner = "Usage: ti new [options]"
        opts.on_head(
          "-t TITLE", "--title TITLE",
          "Title to use for the name of the new ticket"){|v| options.title = v }
      end

      def execute
        if title = options.title
          ticket_show(tic.ticket_new(title, options.to_hash))
        else
          # interactive
          prompt = "\n# ---\ntags:\n"
          prompt += "# first line will be the title of the tic, the rest will be the first comment\n"
          prompt += "# if you would like to add initial tags, put them on the 'tags:' line, comma delim"

          if message = get_editor_message(prompt)
            title = message.shift
            if title && title.chomp.length > 0
              title = title.chomp
              if message.last[0, 5] == 'tags:'
                tags = message.pop
                tags = tags.gsub('tags:', '')
                tags = tags.split(',').map { |t| t.strip }
              end
              if message.size > 0
                comment = message.join("")
              end
              ticket_show(tic.ticket_new(title, :comment => comment, :tags => tags))
            else
              puts "You need to at least enter a title"
            end
          else
            puts "It seems you wrote nothing"
          end
        end
      end
    end
  end
end
