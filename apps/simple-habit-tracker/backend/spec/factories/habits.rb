FactoryBot.define do
  factory :habit do

    name { "MyString" }
    icon { "MyString" }
    color { "MyString" }
    description { "MyText" }
    frequency { "MyString" }
    target_days { 1 }
    reminder_time { "MyString" }
    reminder_enabled { true }
    streak_count { 1 }
    longest_streak { 1 }
    total_completions { 1 }
    completed_dates { "MyText" }

  end
end
