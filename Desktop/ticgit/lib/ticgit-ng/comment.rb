module TicGitNG
  class Comment

    attr_reader :base, :user, :added, :comment

    def initialize(base, file_name, sha)
      @base = base
      @comment = base.git.gblob(sha).contents rescue nil

      type, date, user = file_name.split('_')

      @added = Time.at(date.to_i)
      @user = user
    end

  end
end
