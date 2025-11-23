class Habit < ApplicationRecord
  # Validations
  validates :name, presence: true, length: { maximum: 100 }
  validates :icon, length: { maximum: 10 }
  validates :color, length: { maximum: 50 }
  validates :frequency, inclusion: { in: %w[daily weekly custom] }, allow_nil: true
  validates :streak_count, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :longest_streak, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :total_completions, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  # Serialization for completed_dates (JSON array)
  serialize :completed_dates, coder: JSON

  # Callbacks
  before_validation :set_defaults, on: :create

  # Instance methods
  def check_in!(date = Date.today)
    date_str = date.to_s
    dates = (completed_dates || [])
    
    # Avoid duplicates
    return false if dates.include?(date_str)
    
    # Add the date
    dates << date_str
    self.completed_dates = dates.sort
    self.total_completions = dates.size
    
    # Update streak
    calculate_streak!
    
    save
  end

  def calculate_streak!
    return self.streak_count = 0 if completed_dates.blank?
    
    sorted_dates = completed_dates.sort.reverse.map { |d| Date.parse(d) }
    today = Date.today
    
    # Check if today or yesterday was completed
    return self.streak_count = 0 unless [today, today - 1].include?(sorted_dates.first)
    
    # Count consecutive days
    streak = 1
    sorted_dates.each_cons(2) do |current, previous|
      break unless (current - previous).to_i == 1
      streak += 1
    end
    
    self.streak_count = streak
    self.longest_streak = [longest_streak || 0, streak].max
  end

  def completed_today?
    return false if completed_dates.blank?
    completed_dates.include?(Date.today.to_s)
  end

  def completed_on?(date)
    return false if completed_dates.blank?
    completed_dates.include?(date.to_s)
  end

  private

  def set_defaults
    self.icon ||= '✅'
    self.color ||= 'primary'
    self.frequency ||= 'daily'
    self.reminder_enabled = false if reminder_enabled.nil?
    self.streak_count ||= 0
    self.longest_streak ||= 0
    self.total_completions ||= 0
    self.completed_dates ||= []
  end
end
