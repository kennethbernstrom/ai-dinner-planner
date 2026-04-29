export type TopMealsScope = 'all' | 'year'

export interface TopMealsOptions {
  scope: TopMealsScope
  year?: number
  limit?: number
}

export interface TopMealRank {
  rank: number
  mealId: number
  title: string
  imageUrl: string | null
  timesScheduled: number
}
