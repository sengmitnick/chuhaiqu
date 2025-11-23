class CreateHabits < ActiveRecord::Migration[7.2]
  def change
    create_table :habits do |t|
      t.string :name
      t.string :icon
      t.string :color
      t.text :description
      t.string :frequency
      t.integer :target_days
      t.string :reminder_time
      t.boolean :reminder_enabled
      t.integer :streak_count, default: 0
      t.integer :longest_streak, default: 0
      t.integer :total_completions, default: 0
      t.text :completed_dates


      t.timestamps
    end
  end
end
