import React from "react"
import axios from 'axios'
import { v4 as uuid } from 'uuid'
import "./css/base.css"
import "./css/App.css"
import TasteOptions from "./Components/TasteOptions"
import { Button, Card, TextField } from "@mui/material"
import { textTransform } from "@mui/system"


//Header component for login.
function Header () {
  return (
    < header >
      <div className="w">
        <div className="login">
          < a href="#">Please login</ a>
        </div>
      </div>
    </header >
  )
}


//Search component for searching a taste.
class Search extends React.Component {
  state = {
    search_item: "",  //Holds the input user enters. 
    parsed_search_item: []
  }

  //Update search_item when the input changes.
  searchItemChange = (e) => {
    this.setState({
      search_item: e.target.value
    })
  }

  //Sends the input to App when clicks on the button.
  getSearchItemHandler = () => {
    // if (this.state.search_item === "sweet" ||
    //   this.state.search_item === "salty" ||
    //   this.state.search_item === "sour" ||
    //   this.state.search_item === "bitter" ||
    //   this.state.search_item === "savory")  //Search only based on valid input.
    // {
    //   this.props.getSearchItem(this.state.search_item)
    // }
    // else {
    //   alert("The search item can only be sweet, salty, sour, bitter, or savory.")
    // }

    this.setState({
      parsed_search_item: this.state.search_item.toLowerCase().split(" ")
    }, () => {
      //Check the number of search items.
      if (this.state.parsed_search_item.length > 3) {
        alert("There are more than 3 search items.")
      }
      for (let x = 0; x < this.state.parsed_search_item.length; x++) {
        if (this.state.parsed_search_item[x] === "sweet" ||
          this.state.parsed_search_item[x] === "salty" ||
          this.state.parsed_search_item[x] === "sour" ||
          this.state.parsed_search_item[x] === "bitter" ||
          this.state.parsed_search_item[x] === "savory")  //Search only based on valid input.
        {
          continue
        }
        else {
          alert("The search item can only be sweet, salty, sour, bitter, or savory.")
        }
      }
      this.props.getSearchItem(this.state.parsed_search_item)
    })
  }

  render () {
    return (
      <div className="content w">
        <div className="logo">Food Search by Taste</div>
        <TasteOptions />
        <div className="search">
          <TextField
            type="search"
            placeholder="Enter Any Taste"
            value={this.state.search_item}
            onChange={this.searchItemChange}
            sx={{ width: "800px" }}
            size="small"
          >
          </TextField>
          <Button
            sx={{ textTransform: "none", height: "20px", backgroundColor: "#F6932E" }}
            variant="contained"
            onClick={this.getSearchItemHandler}
            size="medium"
          >Search!
          </Button>
        </div>
      </div>
    )
  }
}

//Result component for displaying result.
class Result extends React.Component {
  state = {
    recipe_list: [],
    //****** ApiKey ******/
    key: "b589b93113194426aaf359c262390e17"
  }

  //Call the random recipe api for one recipt.
  queryRecipes () {
    return axios({
      url: 'https://api.spoonacular.com/recipes/random',
      params: {
        apiKey: this.state.key,
        number: 10
      }
    }).then(response => {
      return response.data.recipes
    }).catch((error) => {
      console.log(error)
    })
  }

  //Call the taste api for a particular recipe.
  queryRecipeTaste (recipeID) {
    return axios({
      url: 'https://api.spoonacular.com/recipes/' + recipeID + '/tasteWidget.json',
      params: {
        apiKey: this.state.key
      }
    }).then(response => {
      return response.data
    }).catch((error) => {
      console.log(error)
    })
  }

  //Generate a list of recipes .
  async getApplicableRecipes (queryTaste) {
    //Number of recipes returned.
    const recipes = await this.queryRecipes()
    console.log(recipes)
    for (let x = 0; x < recipes.length; x++) {
      const taste_stats = await this.queryRecipeTaste(recipes[x].id)
      console.log(taste_stats)
      console.log(x)
      if (queryTaste.includes("sweet")) {
        if (taste_stats.sweetness >= 50) {
          this.setState({
            recipe_list: [...this.state.recipe_list, recipes[x]]
          })
          console.log(this.state.recipe_list)
        }
      }
      else if (queryTaste.includes("salty")) {
        if (taste_stats.saltiness >= 30) {
          this.setState({
            recipe_list: [...this.state.recipe_list, recipes[x]]
          })
          console.log(this.state.recipe_list)
        }
      }

      else if (queryTaste.includes("sour")) {
        if (taste_stats.sourness >= 20) {
          this.setState({
            recipe_list: [...this.state.recipe_list, recipes[x]]
          })
          console.log(this.state.recipe_list)
        }

      }

      else if (queryTaste.includes("bitter")) {
        if (taste_stats.bitterness >= 20) {
          this.setState({
            recipe_list: [...this.state.recipe_list, recipes[x]]
          })
        }
      }

      else if (queryTaste.includes("savory")) {
        if (taste_stats.savoriness >= 30) {
          this.setState({
            recipe_list: [...this.state.recipe_list, recipes[x]]
          })
        }
      }
    }
  }

  //Monitor change of search item and call getApplicableRecipes if there is a change.
  componentWillReceiveProps (nextProps) {
    if (nextProps.parsed_search_item !== this.props.parsed_search_item) {
      this.setState({
        recipe_list: []
      }, () => { this.getApplicableRecipes(nextProps.parsed_search_item) })
      //If it is a different input, regenerate the recipe list.
    }
  }

  render () {
    return (
      <div className="recipe_list w">
        <ul>
          {this.state.recipe_list.map(item => (
            <li key={item.id} className="recipe">
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
                      <li className="ingredient" key={index}>{ingredient.name}</li>
                    )
                    )}
                  </ul>
                </div>
              </div>
            </li>
          )
          )}
        </ul>
      </div>
    )
  }
}

class App extends React.Component {
  state = {
    parsed_search_item: []
  }

  getSearchItem = (item) => {
    this.setState({
      parsed_search_item: item
    })
  }

  render () {
    return (
      <>
        <Header />
        <Search getSearchItem={this.getSearchItem} />
        <Result parsed_search_item={this.state.parsed_search_item} />
      </>
    )
  }
}

export default App