class Api::V1::HabitsController < Api::BaseController
  before_action :set_habit, only: [:show, :update, :destroy, :check_in]

  # GET /api/v1/habits
  def index
    @habits = Habit.order(created_at: :desc)
    render json: @habits
  end

  # GET /api/v1/habits/:id
  def show
    render json: @habit
  end

  # POST /api/v1/habits
  def create
    @habit = Habit.new(habit_params)
    
    if @habit.save
      render json: @habit, status: :created
    else
      render json: { errors: @habit.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/habits/:id
  def update
    if @habit.update(habit_params)
      render json: @habit
    else
      render json: { errors: @habit.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/habits/:id
  def destroy
    @habit.destroy
    head :no_content
  end

  # POST /api/v1/habits/:id/check_in
  def check_in
    date = params[:date] ? Date.parse(params[:date]) : Date.today
    
    if @habit.check_in!(date)
      render json: @habit
    else
      render json: { error: 'Already checked in for this date' }, status: :unprocessable_entity
    end
  end

  private

  def set_habit
    @habit = Habit.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Habit not found' }, status: :not_found
  end

  def habit_params
    params.require(:habit).permit(
      :name,
      :icon,
      :color,
      :description,
      :frequency,
      :target_days,
      :reminder_time,
      :reminder_enabled
    )
  end
end
