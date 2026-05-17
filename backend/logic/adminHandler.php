<?php

/**
 * AdminHandler
 * Sprint 3: Produktverwaltung, Kundenverwaltung
 * Sprint 4: Gutscheinverwaltung
 */
class AdminHandler

{
    private AdminDataHandler $adminDataHandler;
    
     public function __construct(AdminDataHandler $adminDataHandler)
    {
        $this->adminDataHandler = $adminDataHandler;
    }
}
