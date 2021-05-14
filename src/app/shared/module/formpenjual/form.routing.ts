import { NgModule } from '@angular/core';
import { RouterModule,Routes } from '@angular/router'
import { FormPenjualComponent } from '../../../components/registerfirst/datapenjual/formpenjual.component'

const routes: Routes = [
    {path: '', component:FormPenjualComponent},
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports:[RouterModule]
})
export class FormPenjualRouting{}