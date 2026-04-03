
/**
 *  To update the state of the menu
 */

type  ActionType = { type: 'showGrill' } | { type: 'showSalad' } | { type: 'showSeaFood' } | { type: 'closeMenu' }
export type MenuState = { showMenu: boolean, menu: string, closeMenu?: () => boolean }

 export const ReducerFunction = (state:MenuState , action : ActionType) => {
   switch (action.type) {
     case 'showGrill':
       return {...state,
         showMenu:true,
         menu:'showGrill Menu Duis mollis, est non commodo luctus, nisi erat porttitor ligula.',
       }
     case 'showSalad':
       return {...state,
         showMenu:true,
         menu:'showSalad Menu to add prices and menu'
       }
     case 'showSeaFood':
       return {...state,
         showMenu:true,
         menu:'showSeaFood Menu'
       }
     case 'closeMenu':
       return {...state,
         showMenu:false,
       }
     default:
       throw Error('Unknown action.');
   }
 }