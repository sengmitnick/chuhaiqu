require 'rails_helper'

RSpec.describe "Api::V1::Habits", type: :request do
  describe "GET /api/v1/habits" do
    it "returns all habits" do
      # Create test data
      habit1 = Habit.create!(name: "Morning Run", icon: "🏃", color: "primary")
      habit2 = Habit.create!(name: "Read Book", icon: "📖", color: "secondary")

      get "/api/v1/habits"
      
      expect(response).to have_http_status(200)
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
      expect(json.first["name"]).to be_present
    end
  end

  describe "POST /api/v1/habits" do
    it "creates a new habit" do
      habit_params = {
        habit: {
          name: "Meditation",
          icon: "🧘",
          color: "accent",
          frequency: "daily"
        }
      }

      post "/api/v1/habits", params: habit_params
      
      expect(response).to have_http_status(201)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("Meditation")
      expect(json["icon"]).to eq("🧘")
    end

    it "returns error for invalid data" do
      habit_params = {
        habit: {
          name: "",  # Invalid: name is required
        }
      }

      post "/api/v1/habits", params: habit_params
      
      expect(response).to have_http_status(422)
    end
  end

  describe "POST /api/v1/habits/:id/check_in" do
    it "checks in a habit" do
      habit = Habit.create!(name: "Morning Run", icon: "🏃", color: "primary")
      
      post "/api/v1/habits/#{habit.id}/check_in"
      
      expect(response).to have_http_status(200)
      json = JSON.parse(response.body)
      expect(json["streak_count"]).to eq(1)
      expect(json["total_completions"]).to eq(1)
    end

    it "prevents duplicate check-ins on same day" do
      habit = Habit.create!(name: "Morning Run", icon: "🏃", color: "primary")
      
      # First check-in should succeed
      post "/api/v1/habits/#{habit.id}/check_in"
      expect(response).to have_http_status(200)
      
      # Second check-in should fail
      post "/api/v1/habits/#{habit.id}/check_in"
      expect(response).to have_http_status(422)
    end
  end

  describe "DELETE /api/v1/habits/:id" do
    it "deletes a habit" do
      habit = Habit.create!(name: "Morning Run", icon: "🏃", color: "primary")
      
      delete "/api/v1/habits/#{habit.id}"
      
      expect(response).to have_http_status(204)
      expect(Habit.find_by(id: habit.id)).to be_nil
    end
  end
end
