import React, { Component } from 'react'
import axios from 'axios'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Button, Card, TextField, Collapse } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import { spacing } from '@mui/system'
import { useState } from 'react'
// import { useState } from 'react';
import FavButton from './FavButton'
import FavRecipes from './FavRecipes'
import Cookies from 'js-cookie'

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props
  return <IconButton {...other} />
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}))

export default class Result extends React.Component {
  state = {
    recipe_list: [],
    //****** ApiKey ******/
    key: [
      '71572cc55469424d9b3c4f90dddce7a4',
      '3c8b0356c9fe4e68838c5a700de725a0',
      'b589b93113194426aaf359c262390e17',
      'ad17578f923946ffb9d9fe3902c7ac0b',
      'bc3abec2a0b749d285f7b43711c11c12',
      '8b75ca578a6942c6b 2b061a122b72380',
    ],
    key_index: 0,

    username: [],
  }

  handleExpandClick = (item_index) => {
    this.setState({
      recipe_list: this.state.recipe_list.map((item, index) =>
        index == item_index ? { ...item, expanded: !item.expanded } : item
      ),
    })
  }

  //Call the random recipe api for one recipt.
  queryRecipes() {
    return axios({
      url: 'https://api.spoonacular.com/recipes/random',
      params: {
        apiKey: this.state.key[this.state.key_index],
        number: 20,
      },
    })
      .then((response) => {
        return response.data.recipes
      })
      .catch((error) => {
        console.log(error)
        if (this.state.key.length <= this.state.key_index) {
          console.log(
            'Sorry, daily points of all Api Keys are used up. No more search!'
          )
        } else {
          this.setState(
            {
              key_index: this.state.key_index + 1,
            },
            () => {
              this.queryRecipes()
            }
          )
        }
      })
  }

  //Call the taste api for a particular recipe.
  queryRecipeTaste(recipeID) {
    return axios({
      url:
        'https://api.spoonacular.com/recipes/' + recipeID + '/tasteWidget.json',
      params: {
        apiKey: this.state.key[this.state.key_index],
      },
    })
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.log(error)
        if (this.state.key.length <= this.state.key_index) {
          console.log(
            'Sorry, daily points of all Api Keys are used up. No more search!'
          )
        } else {
          this.setState(
            {
              key_index: this.state.key_index + 1,
            },
            () => {
              this.queryRecipeTaste()
            }
          )
        }
      })
  }

  queryRecipeNutrition(recipeID) {
    return axios({
      url:
        'https://api.spoonacular.com/recipes/' +
        recipeID +
        '/nutritionWidget.json',
      params: {
        apiKey: this.state.key[this.state.key_index],
      },
    })
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.log(error)
        if (this.state.key.length <= this.state.key_index) {
          console.log(
            'Sorry, daily points of all Api Keys are used up. No more search!'
          )
        } else {
          this.setState(
            {
              key_index: this.state.key_index + 1,
            },
            () => {
              this.queryRecipeNutrition()
            }
          )
        }
      })
  }

  // Call Liked Recipes Api when to allow user to save a recipe
  saveRecipe(userID, recipeID) {
    return axios
      .post({
        url: 'http://localhost:8090/api/likedRecipe/addLikeRecipe',
        params: {
          userId: null, //null temporarily
          recipeId: recipeID,
        },
      })
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.log(error)
      })
  }

  // retreives all the recipe saved by a user
  getSavedRecipes() {
    return axios({
      url: 'http://localhost:8090/api/likedRecipe/findByUserId',
      params: {
        userId: null, //null temporarily
      },
    })
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.log(error)
      })
  }

  // deletes a recipe selected by a  user
  deleteRecipe(recipeID) {
    return axios({
      url: 'http://localhost:8090/api/likedRecipe/delete',
      params: {
        userId: null, //null temporarily
        recipeId: recipeID,
      },
    })
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.log(error)
      })
  }

  //Generate a list of recipes .
  async getApplicableRecipes(queryTaste) {
    //Number of recipes returned.
    const recipes = await this.queryRecipes()
    for (let x = 0; x < recipes.length; x++) {
      recipes[x].expanded = false
      const taste_stats = await this.queryRecipeTaste(recipes[x].id)
      if (queryTaste.includes('sweet')) {
        if (taste_stats.sweetness >= 50) {
          const nutrition_stats = await this.queryRecipeNutrition(recipes[x].id)
          recipes[x].nutrition_stats = nutrition_stats
          console.log(recipes[x])
          this.setState({
            recipe_list: [...this.state.recipe_list, recipes[x]],
          })
          continue
        }
      }
      if (queryTaste.includes('salty')) {
        if (taste_stats.saltiness >= 30) {
          const nutrition_stats = await this.queryRecipeNutrition(recipes[x].id)
          recipes[x].nutrition_stats = nutrition_stats
          this.setState({
            recipe_list: [...this.state.recipe_list, recipes[x]],
          })
          continue
        }
      }

      if (queryTaste.includes('sour')) {
        if (taste_stats.sourness >= 20) {
          const nutrition_stats = await this.queryRecipeNutrition(recipes[x].id)
          recipes[x].nutrition_stats = nutrition_stats
          this.setState({
            recipe_list: [...this.state.recipe_list, recipes[x]],
          })
          continue
        }
      }

      if (queryTaste.includes('bitter')) {
        if (taste_stats.bitterness >= 20) {
          const nutrition_stats = await this.queryRecipeNutrition(recipes[x].id)
          recipes[x].nutrition_stats = nutrition_stats
          this.setState({
            recipe_list: [...this.state.recipe_list, recipes[x]],
          })
          continue
        }
      }

      if (queryTaste.includes('savory')) {
        if (taste_stats.savoriness >= 30) {
          const nutrition_stats = await this.queryRecipeNutrition(recipes[x].id)
          recipes[x].nutrition_stats = nutrition_stats
          this.setState({
            recipe_list: [...this.state.recipe_list, recipes[x]],
          })
          continue
        }
      }
    }
    console.log(this.state.recipe_list)
  }

  //Monitor change of search item and call getApplicableRecipes if there is a change.
  componentWillReceiveProps(nextProps) {
    if (nextProps.parsed_search_item !== this.props.parsed_search_item) {
      this.setState(
        {
          recipe_list: [],
        },
        () => {
          this.getApplicableRecipes(nextProps.parsed_search_item)
          this.props.getShowInstruct(false)
        }
      )
      //If it is a different input, regenerate the recipe list.
    }
  }

  handleFavButton(username, recipeId) {
    this.saveRecipe(username, recipeId)
  }

  render() {
    const { username } = this.props
    return (
      <div className="recipe_list w">
        <ul>
          {this.state.recipe_list.map((item, index) =>
            (this.props.diet_option === 'Gain muscle' &&
              item.nutrition_stats.good[0].percentOfDailyNeeds >= 20) ||
            (this.props.diet_option === 'Lower body fat rate' &&
              item.nutrition_stats.bad[3].percentOfDailyNeeds <= 30) ||
            this.props.diet_option === 'None' ||
            this.props.diet_option === 'Stay in shape' ? (
              <li key={item.id} className="recipe">
                <Card>
                  <h1 className="recipe_title">{item.title}</h1>
                  {/* <div>{item.extendedIngredients}</div> */}
                  <div className="recipe_content clearfix">
                    <div className="recipe_img">
                      <img src={item.image} />
                    </div>
                    <div className="recipe_ingredient_list">
                      <h2>Ingredients</h2>
                      <ul>
                        {item.extendedIngredients.map((ingredient, index) => (
                          <li className="ingredient" key={index}>
                            {ingredient.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="like-button">
                      {/*make heart go red when the button is pressed to represent that it has been clicked */}
                      <FavButton username={username} recipeId={item.title} />
                      {/* <FavRecipes username={username} recipeId={item.title}/> */}
                    </div>
                  </div>
                  <CardActions disableSpacing>
                    <ExpandMore
                      expand={item.expanded}
                      onClick={() => {
                        this.handleExpandClick(index)
                      }}
                      aria-expanded={item.expanded}
                      aria-label="show more">
                      <ExpandMoreIcon />
                    </ExpandMore>
                  </CardActions>
                  <Collapse in={item.expanded} timeout="auto" unmountOnExit>
                    <h2 style={{ marginLeft: '30px' }}>Instructions</h2>
                    <div
                      className={'instructions'}
                      dangerouslySetInnerHTML={{
                        __html: item.instructions,
                      }}></div>
                    <h2 style={{ marginLeft: '30px' }}>Nutrition</h2>
                    <div className="nutrition">
                      {item.nutrition_stats.bad[0].percentOfDailyNeeds >= 20 ? (
                        <div className="high_nutrition">
                          High Calories:&nbsp;
                          {item.nutrition_stats.bad[0].percentOfDailyNeeds}
                          (Percent of Daily Needs)
                        </div>
                      ) : (
                        <div className="low_nutrition">
                          Low Calories:&nbsp;
                          {item.nutrition_stats.bad[0].percentOfDailyNeeds}
                          (Percent of Daily Needs)
                        </div>
                      )}
                      {item.nutrition_stats.bad[1].percentOfDailyNeeds +
                        item.nutrition_stats.bad[2].percentOfDailyNeeds >=
                      15 ? (
                        <div className="high_nutrition">
                          High Fat:&nbsp;
                          {item.nutrition_stats.bad[1].percentOfDailyNeeds +
                            item.nutrition_stats.bad[2].percentOfDailyNeeds}
                          (Percent of Daily Needs)
                        </div>
                      ) : (
                        <div className="low_nutrition">
                          Low Fat:&nbsp;
                          {item.nutrition_stats.bad[1].percentOfDailyNeeds +
                            item.nutrition_stats.bad[2].percentOfDailyNeeds}
                          (Percent of Daily Needs)
                        </div>
                      )}
                      {item.nutrition_stats.bad[3].percentOfDailyNeeds >= 30 ? (
                        <div className="high_nutrition">
                          High Carbohydrates:&nbsp;
                          {item.nutrition_stats.bad[3].percentOfDailyNeeds}
                          (Percent of Daily Needs)
                        </div>
                      ) : (
                        <div className="low_nutrition">
                          Low Carbohydrates:&nbsp;
                          {item.nutrition_stats.bad[3].percentOfDailyNeeds}
                          (Percent of Daily Needs)
                        </div>
                      )}
                      {item.nutrition_stats.good[0].percentOfDailyNeeds >=
                      20 ? (
                        <div className="low_nutrition">
                          High Protein:&nbsp;
                          {item.nutrition_stats.good[0].percentOfDailyNeeds}
                          (Percent of Daily Needs)
                        </div>
                      ) : (
                        <div className="high_nutrition">
                          Low Protein:&nbsp;
                          {item.nutrition_stats.good[0].percentOfDailyNeeds}
                          (Percent of Daily Needs)
                        </div>
                      )}
                    </div>
                  </Collapse>
                </Card>
              </li>
            ) : null
          )}
        </ul>
      </div>
    )
  }
}
