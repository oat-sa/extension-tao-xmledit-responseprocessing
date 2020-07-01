<?php
/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */
namespace oat\xmlEditRp\scripts\update;

use \common_ext_ExtensionUpdater;
use oat\taoQtiItem\model\QtiCreatorClientConfigRegistry;

/**
 * Update script of the Extension
 * @author Sam <sam@taotesting.com>
 * @deprecated use migrations instead. See https://github.com/oat-sa/generis/wiki/Tao-Update-Process
 */
class Updater extends common_ext_ExtensionUpdater
{

    /**
     *
     * @param string $initialVersion
     * @return string $versionUpdatedTo
     */
    public function update($initialVersion)
    {
        $this->setVersion($initialVersion);

        if ($this->isVersion('0.1.0')) {
            $registry = QtiCreatorClientConfigRegistry::getRegistry();
            $registry->registerPlugin('xmlResponseProcessing', 'xmlEditRp/qtiCreator/plugins/panel/xmlResponseProcessing', 'panel');
            $this->setVersion('0.2.0');
        }

        $this->skip('0.2.0', '1.1.0');
        
        //Updater files are deprecated. Please use migrations.
        //See: https://github.com/oat-sa/generis/wiki/Tao-Update-Process

        $this->setVersion($this->getExtension()->getManifest()->getVersion());
    }
}
